import { createFileRoute } from '@tanstack/react-router'
import { GanttView } from '@/features/tasks/components/gantt-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/gantt')({
  component: GanttView,
})
