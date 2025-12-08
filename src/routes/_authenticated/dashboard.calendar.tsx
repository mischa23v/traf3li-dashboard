import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, CalendarSkeleton } from '@/utils/lazy-import'

// Lazy load the heavy FullCalendar component
const FullCalendarView = lazyImport(
  () => import('@/features/dashboard/components/fullcalendar-view').then(mod => ({ default: mod.FullCalendarView })),
  <CalendarSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/calendar')({
    component: FullCalendarView,
})
