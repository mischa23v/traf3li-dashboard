import { createFileRoute } from '@tanstack/react-router'
import { TasksReportsCreateView } from '@/features/tasks/components/tasks-reports-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/reports/new')({
  component: TasksReportsCreateView,
})
