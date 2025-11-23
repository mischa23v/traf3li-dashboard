import { createFileRoute } from '@tanstack/react-router'
import ExpensesDashboard from '@/features/finance/components/expenses-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/expenses/')({
    component: ExpensesDashboard,
})
