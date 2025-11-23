import { createFileRoute } from '@tanstack/react-router'
import { CreateEventView } from '@/features/tasks/components/create-event-view'

export const Route = createFileRoute('/_authenticated/dashboard/tasks/events/new')({
    component: CreateEventView,
})
