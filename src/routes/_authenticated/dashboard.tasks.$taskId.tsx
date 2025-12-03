import { createFileRoute } from '@tanstack/react-router'
import { TaskDetailsView } from '@/features/tasks/components/task-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/$taskId')({
    component: TaskDetailsView,
})
