import { createFileRoute } from '@tanstack/react-router'
import { TasksReportsListView } from '@/features/tasks/components/tasks-reports-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/reports/')({
  component: TasksReportsListView,
})
