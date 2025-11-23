import { createFileRoute } from '@tanstack/react-router'
import ImprovedCalendarDashboard from '../../newdesigns/ImprovedCalendarDashboard'

export const Route = createFileRoute('/improved-calendar')({
    component: ImprovedCalendarDashboard,
})
