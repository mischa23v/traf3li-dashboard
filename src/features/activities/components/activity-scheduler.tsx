/**
 * Activity Scheduler Component
 * Schedule activities on any record (Odoo-style)
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
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
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useActivityTypes, useScheduleActivity } from '@/hooks/useOdooActivities'
import type { OdooActivityResModel, OdooActivityType } from '@/types/activity'

// Icon mapping for activity types
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  Upload: <Upload className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  Gavel: <Calendar className="h-4 w-4" />, // Fallback for court
}

interface ActivitySchedulerProps {
  resModel: OdooActivityResModel
  resId: string
  resName?: string
  onScheduled?: () => void
  trigger?: React.ReactNode
  defaultOpen?: boolean
}

export function ActivityScheduler({
  resModel,
  resId,
  resName,
  onScheduled,
  trigger,
  defaultOpen = false,
}: ActivitySchedulerProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [open, setOpen] = React.useState(defaultOpen)
  const [selectedTypeId, setSelectedTypeId] = React.useState<string>('')
  const [summary, setSummary] = React.useState('')
  const [note, setNote] = React.useState('')
  const [deadline, setDeadline] = React.useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const { data: activityTypes, isLoading: typesLoading } = useActivityTypes()
  const scheduleActivity = useScheduleActivity()

  const selectedType = activityTypes?.find((t) => t._id === selectedTypeId)

  // Set default deadline based on activity type
  React.useEffect(() => {
    if (selectedType && !deadline) {
      const now = new Date()
      const { delay_count, delay_unit } = selectedType
      switch (delay_unit) {
        case 'days':
          now.setDate(now.getDate() + delay_count)
          break
        case 'weeks':
          now.setDate(now.getDate() + delay_count * 7)
          break
        case 'months':
          now.setMonth(now.getMonth() + delay_count)
          break
      }
      setDeadline(now)
    }
  }, [selectedType, deadline])

  const handleSubmit = async () => {
    if (!selectedTypeId || !summary || !deadline) return

    try {
      await scheduleActivity.mutateAsync({
        res_model: resModel,
        res_id: resId,
        res_name: resName,
        activity_type_id: selectedTypeId,
        summary,
        summaryAr: isArabic ? summary : undefined,
        note: note || undefined,
        date_deadline: deadline.toISOString(),
      })

      // Reset form
      setSelectedTypeId('')
      setSummary('')
      setNote('')
      setDeadline(undefined)
      setOpen(false)
      onScheduled?.()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const getDecorationColor = (type: OdooActivityType['decoration_type']) => {
    switch (type) {
      case 'danger':
        return 'border-red-500 bg-red-50 dark:bg-red-950'
      case 'warning':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950'
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 me-2" />
            {isArabic ? 'جدولة نشاط' : 'Schedule Activity'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'جدولة نشاط جديد' : 'Schedule New Activity'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'اختر نوع النشاط وحدد الموعد النهائي'
              : 'Choose the activity type and set a deadline'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Activity Type Selection */}
          <div className="space-y-2">
            <Label>{isArabic ? 'نوع النشاط' : 'Activity Type'}</Label>
            {typesLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {activityTypes?.map((type) => (
                  <button
                    key={type._id}
                    onClick={() => setSelectedTypeId(type._id)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                      selectedTypeId === type._id
                        ? getDecorationColor(type.decoration_type)
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    {ACTIVITY_ICONS[type.icon] || <Calendar className="h-4 w-4" />}
                    <span className="text-xs mt-1 text-center">
                      {isArabic ? type.nameAr : type.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">
              {isArabic ? 'ملخص النشاط' : 'Activity Summary'}
            </Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={isArabic ? 'أدخل ملخص النشاط...' : 'Enter activity summary...'}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>{isArabic ? 'الموعد النهائي' : 'Deadline'}</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-start font-normal',
                    !deadline && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="me-2 h-4 w-4" />
                  {deadline
                    ? format(deadline, 'PPP', { locale: isArabic ? ar : enUS })
                    : isArabic
                    ? 'اختر التاريخ'
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    setDeadline(date)
                    setCalendarOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="note">
              {isArabic ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isArabic ? 'أضف ملاحظات...' : 'Add notes...'}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedTypeId || !summary || !deadline || scheduleActivity.isPending
            }
          >
            {scheduleActivity.isPending && (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            )}
            {isArabic ? 'جدولة' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ActivityScheduler
