import { createFileRoute } from '@tanstack/react-router'
import { CreateTaskView } from '@/features/tasks/components/create-task-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/new')({
    component: CreateTaskView,
})
