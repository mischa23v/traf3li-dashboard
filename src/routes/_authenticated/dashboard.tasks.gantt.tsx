import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, CalendarSkeleton } from '@/utils/lazy-import'

// Lazy load the new Tasks Timeline component (replaced heavy DHTMLX Gantt)
const TasksTimelineView = lazyImport(
  () => import('@/features/tasks/components/tasks-timeline-view').then(mod => ({ default: mod.TasksTimelineView })),
  <CalendarSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/tasks/gantt')({
  component: TasksTimelineView,
})
