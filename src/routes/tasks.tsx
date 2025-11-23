import { createFileRoute } from '@tanstack/react-router'
import ExecutiveTasksDashboard from '../../newdesigns/ExecutiveTasksDashboard'

export const Route = createFileRoute('/tasks')({
    component: ExecutiveTasksDashboard,
})
