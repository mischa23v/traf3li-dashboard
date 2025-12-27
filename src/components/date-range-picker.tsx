import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subDays,
  subMonths,
  format,
} from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'custom'

export interface DateRangePickerProps {
  value?: { from: Date | null; to: Date | null }
  onChange: (value: { from: Date | null; to: Date | null } | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showPresets?: boolean
  presets?: DatePreset[]
}

const DEFAULT_PRESETS: DatePreset[] = [
  'today',
  'yesterday',
  'last7days',
  'last30days',
  'thisMonth',
  'lastMonth',
  'thisQuarter',
  'custom',
]

function getPresetRange(preset: DatePreset): { from: Date; to: Date } | null {
  const now = new Date()

  switch (preset) {
    case 'today':
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      }
    case 'yesterday': {
      const yesterday = subDays(now, 1)
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      }
    }
    case 'last7days':
      return {
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now),
      }
    case 'last30days':
      return {
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now),
      }
    case 'thisMonth':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      }
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    }
    case 'thisQuarter':
      return {
        from: startOfQuarter(now),
        to: endOfQuarter(now),
      }
    case 'custom':
      return null
    default:
      return null
  }
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  showPresets = true,
  presets = DEFAULT_PRESETS,
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<DatePreset | null>(
    null
  )
  const [calendarRange, setCalendarRange] = React.useState<DateRange | undefined>(
    value ? { from: value.from || undefined, to: value.to || undefined } : undefined
  )

  const isArabic = i18n.language === 'ar'
  const locale = isArabic ? ar : undefined

  // Preset labels with fallback
  const getPresetLabel = (preset: DatePreset): string => {
    const labels: Record<DatePreset, { ar: string; en: string }> = {
      today: { ar: 'اليوم', en: 'Today' },
      yesterday: { ar: 'أمس', en: 'Yesterday' },
      last7days: { ar: 'آخر 7 أيام', en: 'Last 7 Days' },
      last30days: { ar: 'آخر 30 يوم', en: 'Last 30 Days' },
      thisMonth: { ar: 'هذا الشهر', en: 'This Month' },
      lastMonth: { ar: 'الشهر الماضي', en: 'Last Month' },
      thisQuarter: { ar: 'هذا الربع', en: 'This Quarter' },
      custom: { ar: 'نطاق مخصص', en: 'Custom Range' },
    }

    return isArabic ? labels[preset].ar : labels[preset].en
  }

  // Handle preset selection
  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset)

    if (preset === 'custom') {
      // For custom, just set the preset and let user select dates
      return
    }

    const range = getPresetRange(preset)
    if (range) {
      setCalendarRange({ from: range.from, to: range.to })
      onChange(range)
      setOpen(false)
    }
  }

  // Handle calendar selection
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setCalendarRange(range)

    if (range?.from && range?.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      })
    } else if (range?.from) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.from),
      })
    }
  }

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setCalendarRange(undefined)
    setSelectedPreset(null)
  }

  // Format display text
  const getDisplayText = (): string => {
    if (!value || !value.from) {
      return placeholder || (isArabic ? 'اختر نطاق التاريخ' : 'Select date range')
    }

    try {
      const formatStr = isArabic ? 'dd/MM/yyyy' : 'MMM dd, yyyy'
      const fromStr = format(value.from, formatStr, { locale })
      const toStr = value.to ? format(value.to, formatStr, { locale }) : fromStr

      if (value.from.getTime() === value.to?.getTime()) {
        return fromStr
      }

      return `${fromStr} - ${toStr}`
    } catch {
      return placeholder || (isArabic ? 'اختر نطاق التاريخ' : 'Select date range')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='me-2 h-4 w-4' />
          {getDisplayText()}
          {value && value.from && (
            <X
              className='ms-auto h-4 w-4 opacity-50 hover:opacity-100'
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='flex'>
          {showPresets && (
            <div className='border-e border-border'>
              <div className='flex flex-col gap-1 p-3'>
                {presets.map((preset) => (
                  <Button
                    key={preset}
                    variant={selectedPreset === preset ? 'default' : 'ghost'}
                    size='sm'
                    className={cn(
                      'justify-start text-sm',
                      selectedPreset === preset && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {getPresetLabel(preset)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className='p-3'>
            <Calendar
              mode='range'
              selected={calendarRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              locale={locale}
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
