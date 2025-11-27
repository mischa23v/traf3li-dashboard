import { createFileRoute } from '@tanstack/react-router'
import { FullCalendarView } from '@/features/dashboard/components/fullcalendar-view'

export const Route = createFileRoute('/_authenticated/dashboard/calendar')({
    component: FullCalendarView,
})
