import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, CalendarSkeleton } from '@/utils/lazy-import'

// Lazy load the heavy Gantt chart component
const GanttView = lazyImport(
  () => import('@/features/tasks/components/gantt-view').then(mod => ({ default: mod.GanttView })),
  <CalendarSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/tasks/gantt')({
  component: GanttView,
})
