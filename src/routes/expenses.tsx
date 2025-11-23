import { createFileRoute } from '@tanstack/react-router'
import ExpensesDashboard from '../../newdesigns/ExpensesDashboard'

export const Route = createFileRoute('/expenses')({
    component: ExpensesDashboard,
})
