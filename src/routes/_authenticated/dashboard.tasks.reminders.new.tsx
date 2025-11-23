import { createFileRoute } from '@tanstack/react-router'
import { CreateReminderView } from '@/features/tasks/components/create-reminder-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/reminders/new')({
    component: CreateReminderView,
})
