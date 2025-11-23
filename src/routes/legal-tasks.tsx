import { createFileRoute } from '@tanstack/react-router'
import TaskManagementDashboard from '../../newdesigns/TaskManagementDashboard'

export const Route = createFileRoute('/legal-tasks')({
    component: TaskManagementDashboard,
})
