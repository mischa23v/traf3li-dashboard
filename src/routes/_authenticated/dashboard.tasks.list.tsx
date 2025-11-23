import { createFileRoute } from '@tanstack/react-router'
import { TasksListView } from '@/features/tasks/components/tasks-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/list')({
    component: TasksListView,
})
