import { createFileRoute } from '@tanstack/react-router'
import ImprovedTasksDashboard from '../../newdesigns/ImprovedTasksDashboard'

export const Route = createFileRoute('/improved-tasks')({
    component: ImprovedTasksDashboard,
})
