import { createFileRoute } from '@tanstack/react-router'
import { EventsView } from '@/features/tasks/components/events-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/events/')({
    component: EventsView,
})
