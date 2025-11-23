import { createFileRoute } from '@tanstack/react-router'
import { CreateExpenseView } from '@/features/finance/components/create-expense-view'

export const Route = createFileRoute(
    '/_authenticated/dashboard/finance/expenses/new',
)({
    component: CreateExpenseView,
})
