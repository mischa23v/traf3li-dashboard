import { createFileRoute } from '@tanstack/react-router'
import { ExpenseDetailsView } from '@/features/finance/components/expense-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/expenses/$expenseId')({
    component: ExpenseDetailsView,
})
