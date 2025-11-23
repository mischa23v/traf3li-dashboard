import { createFileRoute } from '@tanstack/react-router'
import { ReminderDetailsView } from '@/features/tasks/components/reminder-details-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/tasks/reminders/$reminderId',
)({
    component: ReminderDetailsView,
})
