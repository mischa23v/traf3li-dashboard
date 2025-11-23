import { createFileRoute } from '@tanstack/react-router'
import { RemindersView } from '@/features/tasks/components/reminders-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/reminders/')({
    component: RemindersView,
})
