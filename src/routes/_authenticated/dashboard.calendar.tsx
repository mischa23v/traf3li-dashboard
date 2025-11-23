import { createFileRoute } from '@tanstack/react-router'
import { CalendarView } from '@/features/dashboard/components/calendar-view'

export const Route = createFileRoute('/_authenticated/dashboard/calendar')({
    component: CalendarView,
})
