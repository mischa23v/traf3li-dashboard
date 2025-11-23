import { createFileRoute } from '@tanstack/react-router'
import { EventDetailsView } from '@/features/tasks/components/event-details-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/tasks/events/$eventId',
)({
    component: EventDetailsView,
})
