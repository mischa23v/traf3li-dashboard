import { createFileRoute } from '@tanstack/react-router'
import { MonthCalendarView } from '@/features/finance/components/month-calendar-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/time-tracking/monthly')({
    component: MonthCalendarView,
})
