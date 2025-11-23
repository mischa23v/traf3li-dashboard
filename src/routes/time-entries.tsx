import { createFileRoute } from '@tanstack/react-router'
import TimeEntriesDashboard from '../../newdesigns/TimeEntriesDashboard'

export const Route = createFileRoute('/time-entries')({
    component: TimeEntriesDashboard,
})
