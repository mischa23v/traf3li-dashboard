import { createFileRoute } from '@tanstack/react-router'
import TaskDetails from '../../newdesigns/TaskDetails'

export const Route = createFileRoute('/task-details')({
    component: TaskDetails,
})
