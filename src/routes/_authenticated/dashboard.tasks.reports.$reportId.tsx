import { createFileRoute } from '@tanstack/react-router'
import { TasksReportsDetailsView } from '@/features/tasks/components/tasks-reports-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/reports/$reportId')({
  component: TasksReportsDetailsView,
})
