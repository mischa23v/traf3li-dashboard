/**
 * Activity Scheduler Component
 * Schedule and manage activities from chatter
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ScheduledActivity, ActivityType } from '@/services/chatterService'
import type { ThreadResModel } from '@/types/message'

interface ActivitySchedulerProps {
  resModel: ThreadResModel
  resId: string
  activities: ScheduledActivity[]
  activityTypes: ActivityType[]
  isLoading?: boolean
  currentUserId?: string
  users?: { _id: string; firstName: string; lastName: string; avatar?: string }[]
  onScheduleActivity?: (data: {
    activityTypeId: string
    summary: string
    summaryAr?: string
    note?: string
    dueDate: string
    userId: string
  }) => void
  onMarkDone?: (activityId: string, feedback?: string) => void
  onCancel?: (activityId: string) => void
  onUpdate?: (activityId: string, data: any) => void
  className?: string
}

export function ActivityScheduler({
  resModel,
  resId,
  activities,
  activityTypes,
  isLoading = false,
  currentUserId,
  users = [],
  onScheduleActivity,
  onMarkDone,
  onCancel,
  onUpdate,
  className,
}: ActivitySchedulerProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [showScheduleDialog, setShowScheduleDialog] = React.useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false)
  const [selectedActivity, setSelectedActivity] = React.useState<ScheduledActivity | null>(null)

  // Group activities by state
  const groupedActivities = React.useMemo(() => {
    const grouped = {
      overdue: [] as ScheduledActivity[],
      today: [] as ScheduledActivity[],
      planned: [] as ScheduledActivity[],
      done: [] as ScheduledActivity[],
    }

    activities.forEach((activity) => {
      if (activity.state === 'done') {
        grouped.done.push(activity)
      } else if (activity.state === 'overdue') {
        grouped.overdue.push(activity)
      } else if (activity.state === 'today') {
        grouped.today.push(activity)
      } else {
        grouped.planned.push(activity)
      }
    })

    return grouped
  }, [activities])

  if (isLoading) {
    return (
      <div className={cn('space-y-3 p-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">
            {isArabic ? 'الأنشطة المجدولة' : 'Scheduled Activities'}
          </h3>
          <Badge variant="secondary">{activities.length}</Badge>
        </div>

        {onScheduleActivity && (
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 me-2" />
                {isArabic ? 'جدولة نشاط' : 'Schedule Activity'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <ScheduleActivityForm
                resModel={resModel}
                resId={resId}
                activityTypes={activityTypes}
                users={users}
                currentUserId={currentUserId}
                isArabic={isArabic}
                onSubmit={(data) => {
                  onScheduleActivity(data)
                  setShowScheduleDialog(false)
                }}
                onCancel={() => setShowScheduleDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Activities List */}
      <ScrollArea className="h-[400px]">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'لا توجد أنشطة مجدولة' : 'No scheduled activities'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic
                ? 'قم بجدولة نشاط لتتبع المهام والمتابعات'
                : 'Schedule an activity to track tasks and follow-ups'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* Overdue */}
            {groupedActivities.overdue.length > 0 && (
              <ActivityGroup
                title={isArabic ? 'متأخرة' : 'Overdue'}
                activities={groupedActivities.overdue}
                icon={<AlertCircle className="h-4 w-4" />}
                color="text-red-600"
                isArabic={isArabic}
                onMarkDone={onMarkDone}
                onCancel={onCancel}
                onUpdate={onUpdate}
              />
            )}

            {/* Today */}
            {groupedActivities.today.length > 0 && (
              <ActivityGroup
                title={isArabic ? 'اليوم' : 'Today'}
                activities={groupedActivities.today}
                icon={<Clock className="h-4 w-4" />}
                color="text-orange-600"
                isArabic={isArabic}
                onMarkDone={onMarkDone}
                onCancel={onCancel}
                onUpdate={onUpdate}
              />
            )}

            {/* Planned */}
            {groupedActivities.planned.length > 0 && (
              <ActivityGroup
                title={isArabic ? 'مجدولة' : 'Planned'}
                activities={groupedActivities.planned}
                icon={<Calendar className="h-4 w-4" />}
                color="text-blue-600"
                isArabic={isArabic}
                onMarkDone={onMarkDone}
                onCancel={onCancel}
                onUpdate={onUpdate}
              />
            )}

            {/* Done */}
            {groupedActivities.done.length > 0 && (
              <ActivityGroup
                title={isArabic ? 'منجزة' : 'Done'}
                activities={groupedActivities.done}
                icon={<CheckCircle2 className="h-4 w-4" />}
                color="text-green-600"
                isArabic={isArabic}
                onMarkDone={onMarkDone}
                onCancel={onCancel}
                onUpdate={onUpdate}
              />
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ==================== ACTIVITY GROUP ====================

interface ActivityGroupProps {
  title: string
  activities: ScheduledActivity[]
  icon: React.ReactNode
  color: string
  isArabic: boolean
  onMarkDone?: (activityId: string, feedback?: string) => void
  onCancel?: (activityId: string) => void
  onUpdate?: (activityId: string, data: any) => void
}

function ActivityGroup({
  title,
  activities,
  icon,
  color,
  isArabic,
  onMarkDone,
  onCancel,
  onUpdate,
}: ActivityGroupProps) {
  return (
    <div>
      <div className={cn('flex items-center gap-2 mb-2', color)}>
        {icon}
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge variant="outline" className="text-xs">
          {activities.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <ActivityItem
            key={activity._id}
            activity={activity}
            isArabic={isArabic}
            onMarkDone={onMarkDone}
            onCancel={onCancel}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}

// ==================== ACTIVITY ITEM ====================

interface ActivityItemProps {
  activity: ScheduledActivity
  isArabic: boolean
  onMarkDone?: (activityId: string, feedback?: string) => void
  onCancel?: (activityId: string) => void
  onUpdate?: (activityId: string, data: any) => void
}

function ActivityItem({ activity, isArabic, onMarkDone, onCancel, onUpdate }: ActivityItemProps) {
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [feedback, setFeedback] = React.useState('')

  const handleMarkDone = () => {
    if (onMarkDone) {
      onMarkDone(activity._id, feedback)
      setShowFeedback(false)
      setFeedback('')
    }
  }

  return (
    <div className="bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Activity Type Icon */}
        <div
          className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: activity.activityType?.color || '#6b7280' }}
        >
          {activity.activityType?.icon || '📌'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Activity Type & Summary */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">
                {isArabic && activity.summaryAr ? activity.summaryAr : activity.summary}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.activityType
                  ? isArabic
                    ? activity.activityType.nameAr
                    : activity.activityType.name
                  : ''}
              </p>
            </div>

            {/* Actions */}
            {activity.state !== 'done' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onMarkDone && (
                    <DropdownMenuItem onClick={() => setShowFeedback(true)}>
                      <CheckCircle2 className="h-4 w-4 me-2 text-green-600" />
                      {isArabic ? 'وضع علامة منجز' : 'Mark as Done'}
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onCancel(activity._id)}
                    >
                      <XCircle className="h-4 w-4 me-2" />
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Note */}
          {activity.note && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{activity.note}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(activity.dueDate), 'PPP', {
                  locale: isArabic ? ar : enUS,
                })}
              </span>
            </div>
            {activity.user && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {activity.user.firstName} {activity.user.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'إتمام النشاط' : 'Complete Activity'}</DialogTitle>
            <DialogDescription>
              {isArabic
                ? 'أضف ملاحظات اختيارية حول إتمام هذا النشاط'
                : 'Add optional feedback about completing this activity'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">{isArabic ? 'الملاحظات' : 'Feedback'}</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  isArabic
                    ? 'اكتب أي ملاحظات أو نتائج...'
                    : 'Write any notes or outcomes...'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedback(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleMarkDone}>
              <CheckCircle2 className="h-4 w-4 me-2" />
              {isArabic ? 'وضع علامة منجز' : 'Mark as Done'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== SCHEDULE ACTIVITY FORM ====================

interface ScheduleActivityFormProps {
  resModel: ThreadResModel
  resId: string
  activityTypes: ActivityType[]
  users: { _id: string; firstName: string; lastName: string; avatar?: string }[]
  currentUserId?: string
  isArabic: boolean
  onSubmit: (data: {
    activityTypeId: string
    summary: string
    summaryAr?: string
    note?: string
    dueDate: string
    userId: string
  }) => void
  onCancel: () => void
}

function ScheduleActivityForm({
  activityTypes,
  users,
  currentUserId,
  isArabic,
  onSubmit,
  onCancel,
}: ScheduleActivityFormProps) {
  const [activityTypeId, setActivityTypeId] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [summaryAr, setSummaryAr] = React.useState('')
  const [note, setNote] = React.useState('')
  const [dueDate, setDueDate] = React.useState<Date>()
  const [userId, setUserId] = React.useState(currentUserId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityTypeId || !summary || !dueDate || !userId) return

    onSubmit({
      activityTypeId,
      summary,
      summaryAr: summaryAr || undefined,
      note: note || undefined,
      dueDate: dueDate.toISOString(),
      userId,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isArabic ? 'جدولة نشاط' : 'Schedule Activity'}</DialogTitle>
        <DialogDescription>
          {isArabic
            ? 'قم بإنشاء نشاط مجدول للمتابعة أو التذكير'
            : 'Create a scheduled activity for follow-up or reminder'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Activity Type */}
        <div>
          <Label htmlFor="activity-type">
            {isArabic ? 'نوع النشاط' : 'Activity Type'}
            <span className="text-destructive">*</span>
          </Label>
          <Select value={activityTypeId} onValueChange={setActivityTypeId}>
            <SelectTrigger id="activity-type">
              <SelectValue
                placeholder={isArabic ? 'اختر نوع النشاط' : 'Select activity type'}
              />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type._id} value={type._id}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{isArabic ? type.nameAr : type.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div>
          <Label htmlFor="summary">
            {isArabic ? 'الملخص' : 'Summary'}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={isArabic ? 'ملخص النشاط' : 'Activity summary'}
            required
          />
        </div>

        {/* Summary (Arabic) */}
        {!isArabic && (
          <div>
            <Label htmlFor="summary-ar">{isArabic ? 'الملخص (عربي)' : 'Summary (Arabic)'}</Label>
            <Input
              id="summary-ar"
              value={summaryAr}
              onChange={(e) => setSummaryAr(e.target.value)}
              placeholder={isArabic ? 'الملخص بالعربية' : 'Summary in Arabic'}
            />
          </div>
        )}

        {/* Note */}
        <div>
          <Label htmlFor="note">{isArabic ? 'ملاحظة' : 'Note'}</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isArabic ? 'ملاحظات إضافية...' : 'Additional notes...'}
            rows={3}
          />
        </div>

        {/* Due Date */}
        <div>
          <Label>
            {isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}
            <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-start font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <Calendar className="h-4 w-4 me-2" />
                {dueDate ? (
                  format(dueDate, 'PPP', { locale: isArabic ? ar : enUS })
                ) : (
                  <span>{isArabic ? 'اختر التاريخ' : 'Pick a date'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker mode="single" selected={dueDate} onSelect={setDueDate} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Assign To */}
        <div>
          <Label htmlFor="assign-to">
            {isArabic ? 'تعيين إلى' : 'Assign To'}
            <span className="text-destructive">*</span>
          </Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="assign-to">
              <SelectValue placeholder={isArabic ? 'اختر المستخدم' : 'Select user'} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          disabled={!activityTypeId || !summary || !dueDate || !userId}
        >
          <Plus className="h-4 w-4 me-2" />
          {isArabic ? 'جدولة' : 'Schedule'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default ActivityScheduler
