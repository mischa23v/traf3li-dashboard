/**
 * Activity List Component
 * Display and manage activities for a record
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format, isToday } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Mail,
  Phone,
  Users,
  CheckSquare,
  Bell,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  Check,
  X,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useRecordActivities,
  useMarkActivityDone,
  useCancelActivity,
} from '@/hooks/useOdooActivities'
import type { OdooActivity, OdooActivityResModel, OdooActivityUser } from '@/types/activity'

// Icon mapping
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  Upload: <Upload className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  Gavel: <Calendar className="h-4 w-4" />,
}

interface ActivityListProps {
  resModel: OdooActivityResModel
  resId: string
  showCompleted?: boolean
  maxItems?: number
  className?: string
}

export function ActivityList({
  resModel,
  resId,
  showCompleted = false,
  maxItems,
  className,
}: ActivityListProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false)
  const [selectedActivity, setSelectedActivity] = React.useState<OdooActivity | null>(null)
  const [feedback, setFeedback] = React.useState('')

  const { data: activities, isLoading } = useRecordActivities(
    resModel,
    resId,
    showCompleted ? undefined : 'scheduled'
  )

  const markDone = useMarkActivityDone()
  const cancelActivity = useCancelActivity()

  const displayedActivities = maxItems ? activities?.slice(0, maxItems) : activities

  const handleMarkDone = async (activity: OdooActivity) => {
    setSelectedActivity(activity)
    setFeedbackDialogOpen(true)
  }

  const handleConfirmDone = async () => {
    if (!selectedActivity) return
    try {
      await markDone.mutateAsync({
        id: selectedActivity._id,
        data: feedback ? { feedback } : undefined,
      })
      setFeedbackDialogOpen(false)
      setFeedback('')
      setSelectedActivity(null)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = async (activityId: string) => {
    try {
      await cancelActivity.mutateAsync(activityId)
    } catch {
      // Error handled by mutation
    }
  }

  const getActivityUser = (user: OdooActivityUser | string): OdooActivityUser | null => {
    if (typeof user === 'string') return null
    return user
  }

  const getActivityStatus = (activity: OdooActivity) => {
    if (activity.state === 'done') return 'done'
    if (activity.state === 'cancelled') return 'cancelled'
    if (activity.is_overdue) return 'overdue'
    if (isToday(new Date(activity.date_deadline))) return 'today'
    return 'planned'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('odooActivities.overdue')}
          </Badge>
        )
      case 'today':
        return (
          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
            <Clock className="h-3 w-3" />
            {t('odooActivities.today')}
          </Badge>
        )
      case 'done':
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <Check className="h-3 w-3" />
            {t('odooActivities.done')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="secondary" className="gap-1">
            <X className="h-3 w-3" />
            {t('odooActivities.cancelled')}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {t('odooActivities.planned')}
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!displayedActivities?.length) {
    return (
      <div className={cn('text-center text-muted-foreground p-4', className)}>
        {t('odooActivities.noActivities')}
      </div>
    )
  }

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {displayedActivities.map((activity) => {
          const status = getActivityStatus(activity)
          const user = getActivityUser(activity.user_id)
          const activityType =
            typeof activity.activity_type_id === 'object' ? activity.activity_type_id : null

          return (
            <div
              key={activity._id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                status === 'overdue' && 'border-red-200 bg-red-50 dark:bg-red-950/20',
                status === 'today' && 'border-orange-200 bg-orange-50 dark:bg-orange-950/20',
                status === 'done' && 'border-green-200 bg-green-50 dark:bg-green-950/20 opacity-75',
                status === 'cancelled' && 'opacity-50'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 p-2 rounded-lg',
                  status === 'overdue' && 'bg-red-100 text-red-600',
                  status === 'today' && 'bg-orange-100 text-orange-600',
                  status === 'done' && 'bg-green-100 text-green-600',
                  status === 'cancelled' && 'bg-gray-100 text-gray-600',
                  status === 'planned' && 'bg-blue-100 text-blue-600'
                )}
              >
                {activityType && ACTIVITY_ICONS[activityType.icon]
                  ? ACTIVITY_ICONS[activityType.icon]
                  : <Calendar className="h-4 w-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{activity.summary}</p>
                    {activityType && (
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? activityType.nameAr : activityType.name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(status)}
                </div>

                {/* Deadline & User */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(activity.date_deadline), 'PP', {
                      locale: isArabic ? ar : enUS,
                    })}
                  </span>
                  {user && (
                    <span className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-[8px]">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                </div>

                {/* Note preview */}
                {activity.note && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {activity.note}
                  </p>
                )}

                {/* Done feedback */}
                {activity.feedback && status === 'done' && (
                  <p className="text-xs text-green-600 mt-1 italic">
                    {activity.feedback}
                  </p>
                )}
              </div>

              {/* Actions */}
              {activity.state === 'scheduled' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMarkDone(activity)}>
                      <Check className="h-4 w-4 me-2" />
                      {t('odooActivities.markDone')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleCancel(activity._id)}
                    >
                      <X className="h-4 w-4 me-2" />
                      {t('odooActivities.cancel')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('odooActivities.completeActivity')}
            </DialogTitle>
            <DialogDescription>
              {t('odooActivities.addFeedbackDescription')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('odooActivities.feedbackPlaceholder')}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              {t('odooActivities.cancel')}
            </Button>
            <Button onClick={handleConfirmDone} disabled={markDone.isPending}>
              {markDone.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('odooActivities.complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ActivityList
