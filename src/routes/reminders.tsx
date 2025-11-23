import { createFileRoute } from '@tanstack/react-router'
import RemindersDashboard from '../../newdesigns/RemindersDashboard'

export const Route = createFileRoute('/reminders')({
    component: RemindersDashboard,
})
