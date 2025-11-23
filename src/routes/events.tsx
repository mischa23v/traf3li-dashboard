import { createFileRoute } from '@tanstack/react-router'
import EventsDashboard from '../../newdesigns/EventsDashboard'

export const Route = createFileRoute('/events')({
    component: EventsDashboard,
})
